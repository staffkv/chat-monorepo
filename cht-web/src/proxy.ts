import { NextRequest, NextResponse } from "next/server";
import { getUrl } from "./lib/get-url";


export function proxy(request: NextRequest) {
    const token = request.cookies.get('token') || request.cookies.get('token')
    const pathname = request.nextUrl.pathname

    if(pathname === '/auth/sign-in' && token) {
        return NextResponse.redirect(new URL(getUrl('/app')))
    }

    if(pathname.includes('/app') && !token) {
        return NextResponse.redirect(new URL(getUrl('/auth/sign-in')))
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}