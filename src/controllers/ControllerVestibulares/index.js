// * Importações
const {PrismaClient} = require('@prisma/client')
const Prisma = new PrismaClient()

// * Exportação dos métodos do Controller
module.exports = {

    //POST: Lista as datas dos vestibulares
    async listarDatas(req, res){
        async function main(){
                const {vestibulares} = req.body

            // Verifica se há vestibulares a serem filtrados
            if(vestibulares && vestibulares.length > 0) {
                let dados = []

                for(let i = 0; i < vestibulares.length; i++) {
                    if(vestibulares[i] != '.') {
                        const vest = await Prisma.Vestibulares.findUnique({
                            where: {
                                id: vestibulares[i]
                            }
                        })
                        if(vest != null){dados.push({descricao: vest.descricao, data: vest.data})}
                    }
                }

                dados.sort((a, b) => {
                    let dataA = new Date(a.data.split("/")[2], a.data.split("/")[1], a.data.split("/")[0])
                    let dataB = new Date(b.data.split("/")[2], b.data.split("/")[1], b.data.split("/")[0])
                    return dataA.getTime() - dataB.getTime()
                })

                return res.status(200).send(dados)
            } 
            // Caso não exista preferência configurada
            else {
                let dados = await Prisma.Vestibulares.findMany()

                dados = dados.map(dado=>({descricao: dado.descricao, data: dado.data}))
                dados.sort((a, b) => {
                    let dataA = new Date(a.data.split("/")[2], a.data.split("/")[1], a.data.split("/")[0])
                    let dataB = new Date(b.data.split("/")[2], b.data.split("/")[1], b.data.split("/")[0])
                    return dataA.getTime() - dataB.getTime()
                })

                return res.status(200).send(dados)
            }
        }

        main()
        .then(async () => {
            await Prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error(e)
            await Prisma.$disconnect()
            process.exit(1)
        })
        
    },

    //POST: Busca as preferências do usuário
    async buscarPreferencias(req, res){

        async function main(){
            const {email} = req.body

            //Busca os dados do usuário
            const usuario = await Prisma.Usuarios.findUnique({
                where: {
                    email: email
                }
            });
            if(usuario === null) return res.status(404).send({message: "Usuário não encontrado."})

            // Busca as preferências do usuário
            const preferencias = usuario.preferencias

            // Caso haja preferencias
            if(preferencias && preferencias.length > 0) {
                let dados = await Prisma.Vestibulares.findMany();

                dados = dados.map(dado => ({
                    id: dado.id.toString(),
                    descricao: dado.descricao,
                    prefere: preferencias.includes(dado.id.toString())
                }))

                return res.status(200).send(dados)
            }
            // Caso não existam preferencias
            else {
                let dados = await Prisma.Vestibulares.findMany();

                return res.status(200).send(dados.map(dado=>({
                    id: dado.id.toString(),
                    descricao: dado.descricao,
                    prefere: true,
                })))
            }
        }
        
        main()
        .then(async () => {
            await Prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error(e)
            await Prisma.$disconnect()
            process.exit(1)
        })
    },

    //POST: Alterar preferências do usuário
    async alterarPreferencias(req, res){
        async function main() {

            const {email, preferencias} = req.body
            
            //Busca os dados do usuário
            await Prisma.Usuarios.update({
                where: {
                  email: email,
                },
                data: {
                  preferencias: preferencias,
                },
            })
            return res.status(200).send({message: "Preferências alteradas com sucesso"})

        }
        main()
        .then(async () => {
            await Prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error(e)
            await Prisma.$disconnect()
            process.exit(1)
        })
    }
}