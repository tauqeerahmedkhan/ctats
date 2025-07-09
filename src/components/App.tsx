@@ .. @@
 function AppContent() {
   const { user, isLoading } = useDatabase();
   const [activeView, setActiveView] = useState<'dashboard' | 'attendance' | 'employees' | 'settings' | 'reports'>('dashboard');
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

+  // Listen for navigation events from dashboard and other components
+  useEffect(() => {
+    const handleNavigate = (event: CustomEvent) => {
+      setActiveView(event.detail);
+    };
+
+    window.addEventListener('navigate', handleNavigate as EventListener);
+    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
+  }, []);
+
   // Close sidebar on small screens by default