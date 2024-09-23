import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest, res: NextResponse) {
    console.log("Inside the chat response API");

    if (req.method === 'POST') {
        const { userMessage } = await req.json();

        console.log("This is the user message", userMessage);

        if (!userMessage) {
            return NextResponse.json({error: 'User message is required'}, {status: 422});
        }

        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: userMessage,
                    },
                ],
                model: 'llama3-8b-8192',
            });

            const botResponse = chatCompletion.choices[0]?.message?.content || 'No response from the model';

            return NextResponse.json({botResponse}, {status: 200});
        } catch (error) {
            console.error('Error communicating with Groq:', error);
            return NextResponse.json({error: 'Error generating response'}, {status: 500});
        }
    } else {
        NextResponse.json({error: `Method ${req.method} Not Allowed`}, {status: 405});
    }
}
