'use client';

import type { NextPage } from 'next';
import { SignIn } from "@clerk/nextjs";

const SignInPage: NextPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}

export default SignInPage;
