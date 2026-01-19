import { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
    return (
        <div className="">
            <main>{children}</main>
        </div>
    );
}