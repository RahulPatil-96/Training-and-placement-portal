import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/layout/main-layout';
import { StudentsProvider } from '@/contexts/StudentsContext';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <StudentsProvider>
        <MainLayout />
      </StudentsProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
