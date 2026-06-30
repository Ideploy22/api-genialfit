import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	const email = "master@genialfit.com";

	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		console.log("Master user already exists, skipping seed.");
		return;
	}

	const password = await bcrypt.hash("master@123", 10);

	const user = await prisma.user.create({
		data: {
			name: "Master",
			email,
			password,
			role: Role.MASTER,
		},
	});

	console.log(`Master user created: ${user.email}`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
