"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { AuthCard } from "@/components/app/auth-card";
import { useAuthHelpers } from "@/hooks/use-auth-helpers";

export default function SignUp() {
  const {
    loading,
    signUpFields,
    signUpStaticFields,
    setSignUpFields,
    setImage,
    onSignUpEmailSubmit,
    onSignInSocialClick,
    validateSignUp,
    validateFirstAndLastNameLength,
  } = useAuthHelpers();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file?.type.startsWith("image/")) {
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) {
          fileInputRef.current.files = files;
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <AuthCard
      mode="sign-up"
      title={signUpStaticFields.title}
      description={signUpStaticFields.description}
      footerText={signUpStaticFields.footerText}
      footerLinkText={signUpStaticFields.footerLinkText}
      footerHref={signUpStaticFields.footerHref}
      loading={loading}
      onSubmit={onSignUpEmailSubmit}
      onSignInSocialClick={onSignInSocialClick}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="first-name">First name</Label>
          <Input
            id="first-name"
            onChange={(e) => {
              setSignUpFields({
                ...signUpFields,
                firstName: e.target.value,
              });
            }}
            value={signUpFields.firstName}
            autoComplete="given-name"
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="last-name">Last name</Label>
          <Input
            id="last-name"
            onChange={(e) => {
              setSignUpFields({
                ...signUpFields,
                lastName: e.target.value,
              });
            }}
            value={signUpFields.lastName}
            autoComplete="family-name"
            disabled={loading}
          />
        </div>
        {!validateFirstAndLastNameLength() && (
          <p
            id="name-error"
            role="alert"
            className="col-span-2 text-destructive text-xs -mt-4"
          >
            First + Last name must be 32 characters or less.
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          onChange={(e) => {
            setSignUpFields({ ...signUpFields, email: e.target.value });
          }}
          value={signUpFields.email}
          autoComplete="email"
          disabled={loading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          onChange={(e) => {
            setSignUpFields({
              ...signUpFields,
              password: e.target.value,
            });
          }}
          value={signUpFields.password}
          autoComplete="new-password"
          disabled={loading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Confirm Password</Label>
        <Input
          id="password_confirmation"
          type="password"
          onChange={(e) => {
            setSignUpFields({
              ...signUpFields,
              passwordConfirmation: e.target.value,
            });
          }}
          value={signUpFields.passwordConfirmation}
          autoComplete="new-password"
          disabled={loading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">Profile Image (optional)</Label>
        <div
          className={cn(
            "flex items-center gap-4 border-2 border-dashed rounded-md p-3 transition-colors",
            isDragOver
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {imagePreview && (
            <Avatar className="size-14">
              <AvatarImage src={imagePreview} alt="User avatar" />
            </Avatar>
          )}
          <div className="flex items-center gap-2 w-full">
            <Input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full cursor-pointer"
            />
            {imagePreview && (
              <X
                className="cursor-pointer"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
      <Button
        type="submit"
        className={cn("w-full mt-2", loading ? "" : "cursor-pointer")}
        disabled={loading || !validateSignUp()}
      >
        Create an account
      </Button>
    </AuthCard>
  );
}
