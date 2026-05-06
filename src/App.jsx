import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './shared/AuthContext';
import { EnrollmentProvider } from './shared/EnrollmentContext';
import { ThemeProvider } from './shared/ThemeContext';
import { router } from './router';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EnrollmentProvider>
          <RouterProvider router={router} />
        </EnrollmentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
