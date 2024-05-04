export class UserActivityHappenedEvent {
  constructor(
    public readonly userId: string,
    public readonly activityTime: Date,
  ) {}
}
