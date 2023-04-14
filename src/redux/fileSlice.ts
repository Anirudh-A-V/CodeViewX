import { createSlice } from "@reduxjs/toolkit";

interface Tab {
    id: number;
    name: string;
    contents: string;
    type: string;
}

interface IFile {
    id?: number;
    name: string;
    contents: string;
    type: string;
    lastModified: Date;
}

const initialState = {
    file: null,
    recentFiles: [] as IFile[],
    openTabs: [] as Tab[],
    fileContents: ""
};

export const fileSlice = createSlice({
    name: "file",
    initialState,
    reducers: {
        setFile: (state, action) => {
            state.file = action.payload;
        },
        setRecentFiles: (state, action) => {
            state.recentFiles = action.payload;
        },
        setOpenTabs: (state, action) => {
            state.openTabs = action.payload;
        },
        setFileContents: (state, action) => {
            state.fileContents = action.payload;
        }
    },
});

export interface fileState {
    file: {
        file: File;
        recentFiles: IFile[];
        openTabs: Tab[];
        fileContents: string;
    }
}

export const { setFile, setRecentFiles, setOpenTabs, setFileContents } = fileSlice.actions;

export default fileSlice.reducer;