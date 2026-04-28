import swaggerSpec from "../../swagger";

export async function GET() {
  return Response.json(swaggerSpec);
}
