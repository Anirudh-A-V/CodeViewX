import { configureStore } from '@reduxjs/toolkit'
import fileSlice from './fileSlice'

export default configureStore({
    reducer: {
        file: fileSlice
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})