import { IsEnum } from "class-validator";
import { TaskStatus } from "../task.entity";

export class TaskStatusDto {
    @IsEnum(TaskStatus)
    status: TaskStatus;
}