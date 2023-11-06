import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {

    constructor(
        private usersRepository: UsersRepository,
        private jwtService: JwtService,
    ) { }

    public async signUp(authCredentialDto: AuthCredentialsDto): Promise<void> {
        return this.usersRepository.createUser(authCredentialDto);
    }

    public async signIn(authCredentialDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        const { username, password } = authCredentialDto;
        let user = await this.usersRepository.findOneBy({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
            const payload: JwtPayload = { username };
            let accessToken = await this.jwtService.sign(payload);
            return { accessToken };
        }
        else {
            throw new UnauthorizedException('Please check your login credentials');
        }
    }
}
