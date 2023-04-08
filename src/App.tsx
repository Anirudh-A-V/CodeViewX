import { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github as syntaxStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Dexie from 'dexie';

function App() {
	const [file, setFile] = useState<File | null>(null);
	const [fileContents, setFileContents] = useState<string | null>(null);
	const [recentFiles, setRecentFiles] = useState<string[]>([]);
	const [openTabs, setOpenTabs] = useState<{ id: number, name: string, contents: string }[]>([]);

	const db = new Dexie('file-db');
	db.version(1).stores({
		files: '++id, name, contents, extension, lastModified',
	});

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
		reader.onload = (event) => {
			if (!event.target) {
				console.log('No file selected');
				return;
			}
			const fileContents = event.target.result;
			console.log(fileContents);
			setFileContents(fileContents as string);
			const newTab = { id: openTabs.length + 1, name: file.name, contents: fileContents as string };
			setOpenTabs([...openTabs, newTab]);
			db.files.add({
				name: file.name,
				contents: fileContents as string,
				extension: file.name.split('.').pop() as string,
				lastModified: new Date(),
			});
		};
		reader.readAsText(file);
	};

	const handleRecentFileClick = async (name: string) => {
		const recentFile = await db.files.where('name').equals(name).first();
		console.log(recentFile)
		if (recentFile) {
			setFile(recentFile);
			setFileContents(recentFile.contents);
			const newTab = { id: openTabs.length + 1, name: recentFile.name, contents: recentFile.contents };
			setOpenTabs([...openTabs, newTab]);
		}
	};

	const handleCloseTabClick = (id: number) => {
		const updatedTabs = openTabs.filter((tab) => tab.id !== id);
		setOpenTabs(updatedTabs);
	};

	return (
		<div className="flex flex-col w-full">
			<h1 className="text-2xl font-bold">File Upload</h1>
			<div className="flex flex-col w-full">
				<label className="text-xl font-bold">File</label>
				<input type="file" onChange={handleFileUpload} />

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
					<div className="flex flex-col mt-4">
						<label className="text-xl font-bold">Open Tabs</label>
						<div className="flex flex-row">
							{openTabs.map((tab) => (
								<div key={tab.id} className="flex flex-col mx-2">
									<button className="rounded-full bg-red-500 text-white font-bold w-4 h-4 flex items-center justify-center" onClick={() => handleCloseTabClick(tab.id)}>
										x
									</button>
									<button className="mt-2 text-blue-600 hover:underline" onClick={() => setFileContents(tab.contents)}>
										{tab.name}
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{fileContents && (
					<div className="flex flex-col mt-4">
						<SyntaxHighlighter language="javascript" style={syntaxStyle}>
							{fileContents}
						</SyntaxHighlighter>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
