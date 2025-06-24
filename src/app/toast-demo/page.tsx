import { ToastExample } from '@/components/ToastExample'

export default function ToastDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Toast Notification Demo</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Try the Toast Notifications</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Click the buttons below to see different types of toast notifications. 
              Each toast will auto-dismiss after a few seconds, or you can click the X to dismiss manually.
              Hover over a toast to pause the auto-dismiss timer.
            </p>
            <ToastExample />
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Usage Example</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">{`import { useToast } from '@/lib/toast'

export function MyComponent() {
  const { toast } = useToast()

  const handleSuccess = () => {
    toast.success('Operation completed successfully!')
  }

  const handleError = () => {
    toast.error('Something went wrong. Please try again.')
  }

  const handleInfo = () => {
    toast.info('New updates are available.')
  }

  const handleWarning = () => {
    toast.warning('Your session will expire soon.')
  }

  const handlePersistent = () => {
    // Duration 0 means the toast won't auto-dismiss
    toast.info('This message will stay until dismissed', { duration: 0 })
  }

  return (
    <div>
      {/* Your component UI */}
    </div>
  )
}`}</code>
            </pre>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Four toast types: success, error, info, and warning</li>
              <li>Auto-dismiss with configurable duration</li>
              <li>Manual dismiss with close button</li>
              <li>Pause on hover to read longer messages</li>
              <li>Stacking support for multiple toasts</li>
              <li>Responsive design that works on all screen sizes</li>
              <li>Dark mode support</li>
              <li>Accessible with proper ARIA attributes</li>
              <li>Smooth animations and transitions</li>
              <li>Maximum toast limit to prevent overflow</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}