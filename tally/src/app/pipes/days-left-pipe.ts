import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'daysLeft', standalone: false })
export class DaysLeftPipe implements PipeTransform {
  transform(deadline: string): string {
    const diff = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / 86400000,
    );
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due today';
    return `${diff} day${diff === 1 ? '' : 's'} left`;
  }
}