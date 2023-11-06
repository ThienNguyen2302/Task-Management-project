import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TasksRepository } from './tasks.repository';
import { Task, TaskStatus } from './task.entity';
import { User } from 'src/auth/user.entity';


@Injectable()
export class TasksService {
    constructor(
        private tasksRepository: TasksRepository,
    ) { }

    public async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        return this.tasksRepository.getTasks(filterDto, user);
    }

    public createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        return this.tasksRepository.createTask(createTaskDto, user);
    }

    public async getTaskById(id: string, user: User): Promise<Task> {
        let found = await this.tasksRepository.findOne({ where: { id, user } });

        if (!found) {
            throw new NotFoundException();
        }

        return found
    }

    public async updateTatus(id: string, status: TaskStatus, user: User): Promise<Task> {
        let task = await this.getTaskById(id, user);
        task.status = status;
        await this.tasksRepository.save(task);
        return task;
    }

    public async deleteTask(id: string, user: User): Promise<void> {
        let result = await this.tasksRepository.delete({ id: id, user });

        if (result.affected === 0) {
            throw new NotFoundException(`Task with ID "${id}" not found`)
        }
        return
    }
}
