"use client";

import { useRef, useState } from 'react';
import { UserPlus, Check, X, Camera } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SignUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpDialog({ open, onOpenChange, onSwitchToSignIn }: SignUpDialogProps) {
  const { t } = useTranslation();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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

      // Upload avatar if one was selected (best-effort, non-blocking)
      if (avatarFile && data?.user?.id) {
        try {
          const fd = new FormData();
          fd.append("avatar", avatarFile);
          await fetch("/api/auth/upload-avatar", { method: "POST", body: fd });
        } catch {
          // Avatar upload failure is non-fatal
        }
      }

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        studentId: '',
        password: '',
        confirmPassword: '',
      });
      setAvatarFile(null);
      setAvatarPreview(null);

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
    onSwitchToSignIn?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <DialogTitle>{t.auth.signUpTitle}</DialogTitle>
          </div>
          <DialogDescription>{t.auth.signUpDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <a href="/api/auth/google" className="w-full">
            <Button type="button" variant="outline" className="w-full gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t.auth.continueWithGoogle}
            </Button>
          </a>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">or</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Profile picture */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden bg-blue-50 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors flex items-center justify-center group"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="h-7 w-7 text-blue-400 group-hover:text-blue-600 transition-colors" />
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </button>
            <p className="text-xs text-gray-400">
              {avatarFile ? avatarFile.name : "Upload profile photo (optional)"}
            </p>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setAvatarFile(file);
                setAvatarPreview(URL.createObjectURL(file));
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">{t.auth.fullName} *</Label>
            <Input
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.emailAddress} *</Label>
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
            <Label htmlFor="password">{t.auth.password} *</Label>
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
            <Label htmlFor="confirmPassword">{t.auth.confirmPassword} *</Label>
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
              {t.common.cancel}
            </Button>
            <Button type="submit" className="flex-1">
              {t.auth.signUp}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 pt-2">
            {t.auth.alreadyAccount}{' '}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={handleSwitchToSignIn}
            >
              {t.auth.signIn}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}