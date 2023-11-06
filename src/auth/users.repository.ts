import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { User } from "./user.entity";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersRepository extends Repository<User> {

    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    public async createUser(authCredentialDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialDto;
        let salt = await bcrypt.genSalt();
        let hashedPassword = await bcrypt.hash(password, salt);
        let user = this.create({ username, password: hashedPassword });
        try {
            await this.save(user)
        } catch (error) {
            if (error.code === '23505') {
                // duplicate username
                throw new ConflictException('Username already exists');
            } else {
                throw new InternalServerErrorException();
            }
        }
    }
}