import { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr]">
            <main>{children}</main>
        </div>
    );
}