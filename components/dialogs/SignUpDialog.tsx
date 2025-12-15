import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../dialog';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { UserPlus, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface SignUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpDialog({ open, onOpenChange, onSwitchToSignIn }: SignUpDialogProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      setErrors({ ...errors, password: 'Password must be at least 8 characters' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          student_id: formData.studentId || null,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.error === "Email already registered") {
          toast.error(data.error || "Email already exists");
          return
        }
        toast.error(data.error || "Signup failed");
        return;
      }

      toast.success("Account created successfully! Check your email to verify your account.");

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        studentId: '',
        password: '',
        confirmPassword: '',
      });

      setErrors({
        password: '',
        confirmPassword: ''
      });

      handleSwitchToSignIn();

    } catch (err) {
      toast.error("Network error. Please try again.");
    }
  };

  const handleSwitchToSignIn = () => {
    onOpenChange(false);
    if (onSwitchToSignIn) {
      onSwitchToSignIn();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <DialogTitle>Create Account</DialogTitle>
          </div>
          <DialogDescription>
            Join UIBK Lost & Found community to report and find items
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+43 664 123 4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID (Optional)</Label>
            <Input
              id="studentId"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="e.g., 12345678"
            />
          </div>


          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setErrors({ ...errors, password: '' });
                }}
                placeholder="Minimum 8 characters"
                className={formData.password.length > 0 && formData.password.length < 8 ? 'border-red-300' : formData.password.length >= 8 ? 'border-green-300' : ''}
              />
              {formData.password.length >= 8 && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
              )}
              {formData.password.length > 0 && formData.password.length < 8 && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600" />
              )}
            </div>

            {formData.password.length > 0 && formData.password.length < 8 && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <X className="h-3 w-3" />
                Password must be at least 8 characters
              </p>
            )}

            {formData.password.length >= 8 && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Password strength is good
              </p>
            )}

            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                placeholder="Re-enter your password"
                className={
                  formData.confirmPassword.length > 0
                    ? formData.password === formData.confirmPassword && formData.password.length >= 8
                      ? 'border-green-300'
                      : 'border-red-300'
                    : ''
                }

              />
              {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && formData.password.length >= 8 && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />

              )}
              {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600" />
              )}
            </div>

            {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <X className="h-3 w-3" />
                Passwords do not match
              </p>
            )}

            {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && formData.password.length >= 8 && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Passwords match
              </p>
            )}

            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Sign Up
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 pt-2">
            Already have an account?{' '}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={handleSwitchToSignIn}
            >
              Sign In
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}