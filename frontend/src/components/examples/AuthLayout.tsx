import AuthLayout from '../AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthLayoutExample() {
  return (
    <AuthLayout title="Example Form" subtitle="This is a demo of the auth layout">
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="demo-email">Email</Label>
          <Input id="demo-email" type="email" placeholder="Enter email" className="h-12" />
        </div>
        <Button type="submit" className="w-full h-12">Submit</Button>
      </form>
    </AuthLayout>
  );
}
