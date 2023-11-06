import { DataSource, Repository } from "typeorm";
import { Task, TaskStatus } from "./task.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { GetTasksFilterDto } from "./dto/get-tasks-filter.dto";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { User } from "src/auth/user.entity";

@Injectable()
export class TasksRepository extends Repository<Task> {
    private logger = new Logger('TasksRepository');

    constructor(private dataSource: DataSource) {
        super(Task, dataSource.createEntityManager());
    }

    public async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const { title, description } = createTaskDto;
        const task = this.create({
            title,
            description,
            status: TaskStatus.OPEN,
            user,
        });

        await this.save(task);
        return task;
    }

    public async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        let { status, search } = filterDto;

        let query = this.createQueryBuilder('task');
        query.where({ user })
        
        if (status) {
            query.andWhere('task.status = :status', { status });
        }

        if (search) {
            query.andWhere(
                '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
                { search: `%${search}%` },
            );
        }

        try {
            let tasks = await query.getMany();
            return tasks;
        } catch (error) {
            this.logger.error(
                `Failed to get tasks for user "${user.username
                }". Filters: ${JSON.stringify(filterDto)}`,
                error.stack,
            );
            throw new InternalServerErrorException();
        }
    }
}