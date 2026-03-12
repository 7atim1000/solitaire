import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'



// to use notistack for Notifications Msg
import { SnackbarProvider } from 'notistack'
// to use tanstack/reactquery
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' 

// redux configration
import { Provider } from 'react-redux'
import store from './redux/store.js'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime : 30000,
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store ={store}>
      
      <SnackbarProvider autoHideDuration={3000}>
        <QueryClientProvider client ={queryClient}>
          <App />
        </QueryClientProvider>
      </SnackbarProvider>
      
    </Provider>
  </StrictMode>,
)
