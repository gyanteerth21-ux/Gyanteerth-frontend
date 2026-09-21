import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './shared/AuthContext';
import { EnrollmentProvider } from './shared/EnrollmentContext';
import { ThemeProvider } from './shared/ThemeContext';
import { ConfirmProvider } from './components/shared/ConfirmProvider';
import { router } from './router';

function App() {
  return (
    <ThemeProvider>
      <ConfirmProvider>
        <AuthProvider>
          <EnrollmentProvider>
            <RouterProvider router={router} />
          </EnrollmentProvider>
        </AuthProvider>
      </ConfirmProvider>
    </ThemeProvider>
  );
}

export default App;
