import { setFile, setFileContents, setRecentFiles, setOpenTabs } from '../redux/fileSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fileState } from '../redux/fileSlice';
import { GrFormClose } from "react-icons/gr" 

interface Tab {
    id: number;
    name: string;
    contents: string;
    type: string;
}

type Props = {
    tab: Tab
}

const Tab = (props: Props) => {
    const dispatch = useDispatch()
    const file = useSelector((state: fileState) => state.file.file);
	const fileContents = useSelector((state: fileState) => state.file.fileContents);
	const recentFiles = useSelector((state: fileState) => state.file.recentFiles);
	const openTabs = useSelector((state: fileState) => state.file.openTabs);

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
        <div key={props.tab.id} className="flex items-center bg-slate-200 justify-center pr-2 mx-2 hover:bg-slate-300 rounded-md">
            <button className=" text-slate-900 p-2" onClick={() => {
                // setFileContents(tab.contents)
                dispatch(setFileContents(props.tab.contents))
            }}>
                {props.tab.name}
            </button>
            <button className="rounded-full hover:bg-red-200 text-white font-bold w-5 h-5 flex items-center justify-center" onClick={() => handleCloseTabClick(props.tab.id)}>
                <GrFormClose className='w-3 h-3 text-slate-50 bg-transparent' />
            </button>
        </div>
    )
}

export default Tab