export class UserActivityHappenedEvent {
  constructor(
    public readonly userId: string,
    public readonly activityTime: Date,
  ) {}
}

export class UserLoggedInEvent {
  constructor(public readonly userId: string) {}
}
