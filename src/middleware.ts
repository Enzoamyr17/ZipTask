import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";


export async function middleware(req: NextRequest) {    

    const res = NextResponse.next();

    const supabase = createMiddlewareClient({ req,res })

    try {
        const {
            data: { session }
        } = await supabase.auth.getSession();

        if (!session && req.nextUrl.pathname !== '/') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    } catch (error) {
        console.error('Error fetching session:', error);
        if (req.nextUrl.pathname !== '/') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    return res

}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ]

}