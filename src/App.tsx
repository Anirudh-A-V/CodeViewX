import { useEffect } from 'react';
import Dexie from 'dexie';
import CodeViewer from './components/CodeViewer';
import { setFile, setFileContents, setRecentFiles, setOpenTabs } from './redux/fileSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fileState } from './redux/fileSlice';
import Tab from './components/Tab';



function App() {
	const dispatch = useDispatch();
	const file = useSelector((state: fileState) => state.file.file);
	const fileContents = useSelector((state: fileState) => state.file.fileContents);
	const recentFiles = useSelector((state: fileState) => state.file.recentFiles);
	const openTabs = useSelector((state: fileState) => state.file.openTabs);

	class MyAppDatabase extends Dexie {
		files: Dexie.Table<IFile>;
		constructor () {
			super("MyAppDatabase");
			this.version(1).stores({
				files: '++id, name, contents, type, lastModified',
			});
		}
	}

	const db = new MyAppDatabase();
	
	interface IFile {
		id?: number;
		name: string;
		contents: string;
		type: string;
		lastModified: Date;
	}

	async function loadRecentFiles() {
		const recent = await db.files.orderBy('lastModified').reverse().limit(5).toArray();
		dispatch(setRecentFiles(recent.map((file: any) => file)));
	}

	useEffect(() => {
		loadRecentFiles();
	}, [db.files]);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) {
			console.log('No file selected');
			return;
		}
		const file = event.target.files[0];
		
		dispatch(setFile(file));

		const reader = new FileReader();
		if (!reader) {
			console.log('File reader not supported');
			return;
		}
		if (file !== null) {
			reader.onload = (event) => {
				if (!event.target) {
					console.log('No file selected');
					return;
				}
				const fileContents = event.target.result;
				
				dispatch(setFileContents(fileContents as string));

				const newTab = { id: openTabs.length + 1, name: file.name, contents: fileContents as string, type: file.type };
				
				dispatch(setOpenTabs([...openTabs, newTab]));
				db.files.add({
					name: file.name,
					contents: fileContents as string,
					type: file.type,
					lastModified: new Date(),
				});
			};
			reader.readAsText(file);
		}
	};

	const handleRecentFileClick = async (name: string) => {
		const recentFile = await db.files.where('name').equals(name).first();
		if (recentFile) {
			if (openTabs.some((tab) => tab.name === recentFile.name)) {
				dispatch(setFileContents(recentFile.contents));
				return;
			}
			
			dispatch(setFile(recentFile as unknown as File));
			dispatch(setFileContents(recentFile.contents));

			const newTab = { id: openTabs.length + 1, name: recentFile.name, contents: recentFile.contents, type: recentFile.type };
			dispatch(setOpenTabs([...openTabs, newTab]));
		}
	};

	return (
		<div className="flex flex-col w-full mt-3 justify-center items-center">
			<h1 className="text-2xl font-bold my-4">File Upload</h1>
			<div className="flex flex-col justify-center items-center w-full mx-5">
				<div className={`w-4/5 border rounded-lg flex items-center`}>
					<label className={`flex items-center justify-center text-sm font-medium  border  rounded-lg cursor-pointer focus:outline-none w-40 h-10`} htmlFor="file_input">Upload file</label>
					<input className={`w-full text-sm hidden text-gray-800 border hover:bg-gray-600 border-gray-300 bg-gray-500 focus:outline-none rounded-lg cursor-pointer`} aria-describedby="file_input_help" id="file_input" type="file" onChange={handleFileUpload} />
					<div className="w-full flex items-center justify-center">
						<p className="text-sm text-gray-500">{file ? file.name : "No file selected"}</p>
					</div>
				</div>
				{recentFiles.length > 0 && (
					<>
						<label className="text-xl font-bold mt-4">Recent Files</label>
						<ul className="list-disc ml-8">
							{recentFiles.map((file) => (
								<li key={file.id} className="cursor-pointer text-blue-600 hover:underline" onClick={() => handleRecentFileClick(file.name)}>
									{file.name}
								</li>
							))}
						</ul>
					</>
				)}
				{openTabs.length > 0 && (
					<div className="flex flex-col self-start ml-5 mt-4">
						<label className="text-xl font-bold my-5">Open Tabs</label>
						<div className="flex flex-row">
							{openTabs.map((tab) => (
								<Tab key={tab.id} tab={tab} />
							))}
						</div>
					</div>
				)}

				{fileContents && (
					<CodeViewer fileContents={fileContents} file={file}/>
				)}
			</div>
		</div>
	);
}

export default App;
