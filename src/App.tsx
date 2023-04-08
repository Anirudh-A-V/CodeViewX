import { useState } from 'react'

function App() {
	const [file, setFile] = useState<File | null>(null)
	const [fileContents, setFileContents] = useState<string | null>(null)

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) {
			console.log('No file selected')
			return;
		}
		const file = event.target.files[0];
		setFile(file);
		const reader = new FileReader();
		if (!reader) {
			console.log('File reader not supported')
			return;
		}
		reader.onload = (event) => {
			if (!event.target) {
				console.log('No file selected')
				return;
			}
			const fileContents = event.target.result;
			console.log(fileContents);
			setFileContents(fileContents as string);
		};
		reader.readAsText(file);
	};


	return (
		<div className="flex flex-col w-full">
			<h1 className="text-2xl font-bold">File Upload</h1>
			<div className="flex flex-col w-full">
				<label className="text-xl font-bold">File</label>
				<input
					type="file"
					onChange={handleFileUpload}
				/>

				{file && (
					<div className="flex flex-col w-full">
						<label className="text-xl font-bold">File Name</label>
						<input type="text" value={file.name} readOnly />
						<label className="text-xl font-bold">File Size</label>
						<input type="text" value={file.size} readOnly />
						<label className="text-xl font-bold">File Type</label>
						<input type="text" value={file.type} readOnly />
						<label className="text-xl font-bold">File Extension</label>
						<input type="text" value={file.name.split('.').pop()} readOnly />
						<div>
						<label className="text-xl font-bold">File Contents</label>
							<pre>{fileContents}</pre>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default App
