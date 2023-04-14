import { useState, useEffect } from 'react';
import Dexie from 'dexie';
import { GrFormClose } from 'react-icons/gr';
import CodeViewer from './components/CodeViewer';
import { setFile, setFileContents, setRecentFiles, setOpenTabs } from './redux/fileSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fileState } from './redux/fileSlice';



function App() {
	// const [file, setFile] = useState<File | null>(null);
	// const [fileContents, setFileContents] = useState<string | null>(null);
	// const [recentFiles, setRecentFiles] = useState<IFile[]>([]);
	// const [openTabs, setOpenTabs] = useState<{ id: number, name: string, contents: string, type: string }[]>([]);

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
		// setRecentFiles(recent.map((file: any) => file));
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
		// setFile(file);
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
				console.log(fileContents);
				// setFileContents(fileContents as string);
				dispatch(setFileContents(fileContents as string));
				const newTab = { id: openTabs.length + 1, name: file.name, contents: fileContents as string, type: file.type };
				// setOpenTabs([...openTabs, newTab]);
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
		console.log(recentFile)
		if (recentFile) {
			if (openTabs.some((tab) => tab.name === recentFile.name)) {
				// setFileContents(recentFile.contents);
				dispatch(setFileContents(recentFile.contents));
				return;
			}
			// setFile(recentFile as unknown as File);
			dispatch(setFile(recentFile as unknown as File));
			// setFileContents(recentFile.contents);
			dispatch(setFileContents(recentFile.contents));
			const newTab = { id: openTabs.length + 1, name: recentFile.name, contents: recentFile.contents, type: recentFile.type };
			// setOpenTabs([...openTabs, newTab]);
			dispatch(setOpenTabs([...openTabs, newTab]));
		}
	};

	const handleCloseTabClick = (id: number) => {
		const updatedTabs = openTabs.filter((tab) => tab.id !== id);
		if (updatedTabs.length === 0) {
			// setFile(null);
			dispatch(setFile(null));
			// setFileContents(null);
			dispatch(setFileContents(null));
		}

		if (updatedTabs.length > 0) {
			const lastTab = updatedTabs[updatedTabs.length - 1];
			// setFile({ name: lastTab.name, size: 0, type: "" } as File);
			dispatch(setFile({ name: lastTab.name, size: 0, type: "" } as File));
			// setFileContents(lastTab.contents);
			dispatch(setFileContents(lastTab.contents));
		}
		// setOpenTabs(updatedTabs);
		dispatch(setOpenTabs(updatedTabs));
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
								<div key={tab.id} className="flex items-center bg-slate-200 justify-center pr-2 mx-2 hover:bg-slate-300 rounded-md">
									<button className=" text-slate-900 p-2" onClick={() => {
										// setFileContents(tab.contents)
										dispatch(setFileContents(tab.contents))
									}}>
										{tab.name}
									</button>
									<button className="rounded-full hover:bg-red-200 text-white font-bold w-5 h-5 flex items-center justify-center" onClick={() => handleCloseTabClick(tab.id)}>
										<GrFormClose className='w-3 h-3 text-slate-50 bg-transparent' />
									</button>
								</div>
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
