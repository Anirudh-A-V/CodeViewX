import { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github as syntaxStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Dexie from 'dexie';
import { GrFormClose } from 'react-icons/gr';



function App() {
	const [file, setFile] = useState<File | null>(null);
	const [fileContents, setFileContents] = useState<string | null>(null);
	const [recentFiles, setRecentFiles] = useState<string[]>([]);
	const [openTabs, setOpenTabs] = useState<{ id: number, name: string, contents: string, type: string }[]>([]);

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
		setRecentFiles(recent.map((file: any) => file.name));
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
		setFile(file);
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
				setFileContents(fileContents as string);
				const newTab = { id: openTabs.length + 1, name: file.name, contents: fileContents as string, type: file.type };
				setOpenTabs([...openTabs, newTab]);
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
			setFile(recentFile as unknown as File);
			setFileContents(recentFile.contents);
			const newTab = { id: openTabs.length + 1, name: recentFile.name, contents: recentFile.contents, type: recentFile.type };
			setOpenTabs([...openTabs, newTab]);
		}
	};

	const handleCloseTabClick = (id: number) => {
		const updatedTabs = openTabs.filter((tab) => tab.id !== id);
		if (updatedTabs.length === 0) {
			setFile(null);
			setFileContents(null);
		}

		if (updatedTabs.length > 0) {
			const lastTab = updatedTabs[updatedTabs.length - 1];
			setFile({ name: lastTab.name, size: 0, type: "" } as File);
			setFileContents(lastTab.contents);
		}
		setOpenTabs(updatedTabs);
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
							{recentFiles.map((name) => (
								<li key={name} className="cursor-pointer text-blue-600 hover:underline" onClick={() => handleRecentFileClick(name)}>
									{name}
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
									<button className=" text-slate-900 p-2" onClick={() => setFileContents(tab.contents)}>
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
					<div className="flex flex-col mt-4 mx-auto">
						<SyntaxHighlighter language={file ? file.type.split('/').pop() : ''} style={syntaxStyle} customStyle={{background: '#f1f1f1', minWidth: '80%', borderRadius: '30px', scrollbarWidth: 'thin'}} showLineNumbers={true} wrapLines={true} wrapLongLines={true}>
							{fileContents}
						</SyntaxHighlighter>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
