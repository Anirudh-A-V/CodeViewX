type Props = {
    tab: {
        id: number;
        name: string;
        contents: string;
    }
}

const Tab = (props: Props) => {
    return (
        <div key={props.tab.id} className="flex flex-col mx-2">
            <button className="rounded-full bg-red-500 text-white font-bold w-4 h-4 flex items-center justify-center" onClick={() => handleCloseTabClick(tab.id)}>
                x
            </button>
            {/* <button className="mt-2 text-blue-600 hover:underline" onClick={() => setFileContents(props.tab.contents)}>
                {props.tab.name}
            </button> */}
        </div>
    )
}