import { NextRequest, NextResponse } from "next/server"

export async function GET(){
    return Response.json({
        success:true,
        message:"GET request to /api/vapi/generate/route"
    })
}


export async function POST(request,response){
const {role,type,level,techstack,amount,userid} = await request.json()
console.log(role,type,level,techstack,amount,userid)

    return Response.json({
        success:true,
        message:"POST request to /api/vapi/generate/route",
        params:{role,type,level,techstack,amount,userid}
    })
}