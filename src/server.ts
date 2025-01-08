import express from "express";
import { PrismaClient } from "@prisma/client";
import { log } from "console";
import { equal } from "assert";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/movies", async (req, res) => {
    const movies = await prisma.movie.findMany({
        include: {
            genres: true,
            languages: true
        },
        orderBy: {
            title: "asc"
        }
    });
    res.json(movies);
});

app.post("/movies", async (req, res) => {

    const { title, genre_id, language_id, oscar_count, release_date } = req.body;

    try {

        const movieWithSameTitle = await prisma.movie.findFirst({
            where: {
                title: { equals: title, mode: "insensitive" }
            }
        });

        if (movieWithSameTitle) {
            return res.status(409).send({ message: "Ja existe um filme cadastrado com esse título" });
        }

        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date)
            }
        });
    } catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar um filme" });

    }

    res.status(201).send();
});

app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});