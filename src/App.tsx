import { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github as syntaxStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Dexie from 'dexie';

function App() {
	const [file, setFile] = useState<File | null>(null);
	const [fileContents, setFileContents] = useState<string | null>(null);
	const [recentFiles, setRecentFiles] = useState<string[]>([]);

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
		}
	};

	return (
		<div className="flex flex-col w-full">
			<h1 className="text-2xl font-bold">File Upload</h1>
			<div className="flex flex-col w-full">
				<label className="text-xl font-bold">File</label>
				<input type="file" onChange={handleFileUpload} />

				{recentFiles.length > 0 && (
					<div className="flex flex-col w-full mt-4">
						<label className="text-xl font-bold">Recent Files</label>
						{recentFiles.map((name) => (
							<button key={name} onClick={() => handleRecentFileClick(name)}>
								{name}
							</button>
						))}
					</div>
				)}
				{fileContents && file && (
					<div>
						<label className="text-xl font-bold">File Contents</label>
						<p className="text-sm font-bold">{file.name}</p>
						<SyntaxHighlighter language={file ? file.name.split('.').pop() : ''} style={syntaxStyle}>
							{fileContents}
						</SyntaxHighlighter>
					</div>
				)}

			</div>
		</div>
	);
}

export default App;
