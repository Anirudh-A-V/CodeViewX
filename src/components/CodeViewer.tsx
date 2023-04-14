import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github as syntaxStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';
type Props = {
    file: File | null;
    fileContents: string | null;
}

const CodeViewer = (props: Props) => {
    if (props.file === null || props.fileContents === null) {
        return (
            <div className="flex flex-col mt-4 mx-auto">
                <h1 className="text-2xl text-center">No file selected</h1>
            </div>
        )
    }
    
    return (
        <div className="flex flex-col mt-4 mx-auto">
            <SyntaxHighlighter language={props.file ? props.file.type.split('/').pop() : ''} style={syntaxStyle} customStyle={{ background: '#f1f1f1', minWidth: '80%', borderRadius: '30px', scrollbarWidth: 'thin' }} showLineNumbers={true} wrapLines={true} wrapLongLines={true}>
                {props.fileContents}
                {''}
            </SyntaxHighlighter>
        </div>
    )
}

export default CodeViewer