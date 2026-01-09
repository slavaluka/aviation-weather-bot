import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface UserRequestData {
  timestamps: number[];
  blockedUntil: number | null;
}

@Injectable()
export class RateLimiterService {
  private readonly MAX_REQUESTS = 15;
  private readonly TIME_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  private readonly BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour
  private readonly isDevMode: boolean;

  private readonly userRequests = new Map<number, UserRequestData>();

  constructor(private readonly configService: ConfigService) {
    this.isDevMode = this.configService.get<string>('DEV_MODE') === 'true';
  }

  isAllowed(userId: number): boolean {
    // Skip rate limiting in development mode
    if (this.isDevMode) {
      return true;
    }

    const now = Date.now();
    let userData = this.userRequests.get(userId);

    if (!userData) {
      userData = { timestamps: [], blockedUntil: null };
      this.userRequests.set(userId, userData);
    }

    // Check if user is currently blocked
    if (userData.blockedUntil && now < userData.blockedUntil) {
      return false;
    }

    // If block has expired, reset it
    if (userData.blockedUntil && now >= userData.blockedUntil) {
      userData.blockedUntil = null;
      userData.timestamps = [];
    }

    // Remove timestamps older than the time window
    const windowStart = now - this.TIME_WINDOW_MS;
    userData.timestamps = userData.timestamps.filter((ts) => ts > windowStart);

    // Check if user exceeded the limit
    if (userData.timestamps.length >= this.MAX_REQUESTS) {
      userData.blockedUntil = now + this.BLOCK_DURATION_MS;
      return false;
    }

    // Record this request
    userData.timestamps.push(now);
    return true;
  }

  getBlockedUntil(userId: number): Date | null {
    const userData = this.userRequests.get(userId);
    if (userData?.blockedUntil && Date.now() < userData.blockedUntil) {
      return new Date(userData.blockedUntil);
    }
    return null;
  }

  getRemainingRequests(userId: number): number {
    const now = Date.now();
    const userData = this.userRequests.get(userId);

    if (!userData) {
      return this.MAX_REQUESTS;
    }

    if (userData.blockedUntil && now < userData.blockedUntil) {
      return 0;
    }

    const windowStart = now - this.TIME_WINDOW_MS;
    const recentRequests = userData.timestamps.filter(
      (ts) => ts > windowStart,
    ).length;

    return Math.max(0, this.MAX_REQUESTS - recentRequests);
  }
}
