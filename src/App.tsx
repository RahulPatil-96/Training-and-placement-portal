import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { EnhancedMainLayout } from '@/components/layout/enhanced-main-layout';
import { StudentsProvider } from '@/contexts/StudentsContext';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <StudentsProvider>
        <EnhancedMainLayout />
      </StudentsProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;