import Image from "next/image";
import {generateHeadlessUIButton} from "@themify-ui/scripts/gen-component";
import cssToken from '../tokens.json'

const createHeadlessButton = async () => {
    'use server'
    const result = await generateHeadlessUIButton({
            tokens: cssToken,
            label: 'Hallo Dulli',
            request: 'Make the button look like a primary button with a blue background and white text.'
        }
    );
    console.log('the result', result);
}

import { Button } from '@headlessui/react';

interface MyButtonProps {
    label: string;
    className?: string;
}

const MyButton: React.FC<MyButtonProps> = ({ label, className = '' }) => {
    return (
        <Button
            className={`bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${className}`}
        >
            {label}
        </Button>
    );
};


export default function Home() {


    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <Image
                    className="dark:invert"
                    src="/next.svg"
                    alt="Next.js logo"
                    width={180}
                    height={38}
                    priority
                />

                <div className="flex gap-4 items-center flex-col sm:flex-row">
                    <button
                        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
                        type="submit"
                        onClick={createHeadlessButton}
                    >
                        See the component
                    </button>
                </div>
                <MyButton label={"bong"}/>
            </main>
        </div>
    );
}
