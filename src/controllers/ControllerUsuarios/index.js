// * Importações
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const jwt = require('jsonwebtoken')

// * Exportação dos métodos do Controller
module.exports = {

    /**
    * POST: Cadastrar um novo usuário
    */
    cadastrarUsuario(req, res){
        
        async function main() {
            const {email, senha} = req.body
            const usuarios = await prisma.usuario.findFirst({
                where: {
                    email: email
                }
            })

            if(usuarios) return res.status(400).send({message: "Usuário já cadastrado"})
            const {HashPwd} = require('../../services')
            // Processo de criptografia da senha
            const hashedSenha = await HashPwd(senha)
            // Criação do novo objeto
            await prisma.usuario.create({
                data: {
                    email: email,
                    senha: hashedSenha
                }
            })

            return res.status(201).send({message: "Usuário cadastrado com sucesso"})
        }

        main()
        .then(async () => {
            await prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error(e)
            await prisma.$disconnect()
            process.exit(1)
        })
    },

    /**
    * POST: Login
    */
    login(req, res){

        async function main() {
            const {email, senha} = req.body
            const {AuthPwd, SetExpDate} = require('../../services')
            
            const usuario = prisma.usuario.findUnique({
                where: {
                    email: email
                }
            })

            if(usuario) {
                // Autentifica a Senha inserida
                if(await AuthPwd(usuario.senha, senha)) {
                    // Dados inbutidos no JWT
                    const jwtPayload = {
                        email: usuario.email,
                        exp: SetExpDate(Date.now(), 7, "d")
                    }

                    // Token de Acesso enviado ao usuário p/ autentificar
                    const tokenAcesso = jwt.sign(
                        jwtPayload,
                        process.env.JWT_ACCESS_TOKEN_SECRET
                    )
                    return res.status(202).send({message: "Login bem-sucedido", tokenAcesso})
                } else {
                    return res.status(401).send({message: "Senha invalida"})
                }
            } else {
                return res.status(404).send({message: "Usuário não cadastrado"})
            }
        }
        main()
        .then(async () => {
            await prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error(e)
            await prisma.$disconnect()
            process.exit(1)
        })
    }
}