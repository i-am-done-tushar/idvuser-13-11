
// export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// export interface LogEntry {
//   userId?: number;
//   timestamp: string;
//   logLevel: LogLevel;
//   message: string;
//   deviceInfo: string;
//   messageType: string;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class LogService {
//   private logs: LogEntry[] = [];
//   private logLevel: LogLevel = 'debug';
//   private userId?: number;
//   private hasLoggedUserInfo = false;

//   private logLevelsPriority: { [key in LogLevel]: number } = {
//     debug: 0,
//     info: 1,
//     warn: 2,
//     error: 3,
//   };

//   constructor(private http: HttpClient) {
//     this.logUserEnvironment();
//   }

//   /** Set userId once after user is created/fetched */
//   setUserId(id: number) {
//     this.userId = id;
//   }

//   /** Change log level at runtime */
//   setLogLevel(level: LogLevel) {
//     console.log(`Log level changed to: ${level}`);
//     this.logLevel = level;
//   }

//   /** Check if a given log level should be logged */
//   private shouldLog(level: LogLevel): boolean {
//     return this.logLevelsPriority[level] >= this.logLevelsPriority[this.logLevel];
//   }

//   /** Get basic device info (mobile/desktop detection) */
//   private getDeviceInfo(): string {
//     const ua = navigator.userAgent;
//     if (/android/i.test(ua)) return 'Android';
//     if (/iPad|iPhone|iPod/.test(ua)) return 'iPhone';
//     if (/Windows NT|Macintosh/.test(ua)) return 'Desktop/Laptop';
//     return 'Unknown Device';
//   }

//   /** Detailed environment info (for one-time user environment log) */
//   private getUserEnvironmentInfo(): string {
//     const screenWidth = window.screen.width;
//     const screenHeight = window.screen.height;
//     const language = navigator.language || 'unknown';
//     const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
//     // @ts-ignore
//     const networkType = (navigator as any).connection?.effectiveType || 'unknown';
//     const userAgent = navigator.userAgent || 'unknown';

//     return [
//       `Device: ${this.getDeviceInfo()}`,
//       `Screen: ${screenWidth}x${screenHeight}`,
//       `Language: ${language}`,
//       `TimeZone: ${timeZone}`,
//       `Network: ${networkType}`,
//       `UserAgent: ${userAgent}`,
//     ].join('\n  ');
//   }

//   /** Format log message for console/debug output */
//   private formatMessage(level: LogLevel, message: string, messageType: string): string {
//     const timestamp = new Date().toISOString();
//     return `[${timestamp}] [${level.toUpperCase()}] [${messageType}] ${message}`;
//   }

//   /** Log user environment once at service init */
//   private logUserEnvironment() {
//     if (!this.hasLoggedUserInfo) {
//       const userInfo = this.getUserEnvironmentInfo();
//       this.log('info', `User Environment Info:\n${userInfo}`, 'environment');
//       this.hasLoggedUserInfo = true;
//     }
//   }

//   /** Main log method */
//   log(level: LogLevel, message: any, messageType: string='') {
//     if (!this.shouldLog(level)) return;

//     // Ensure message is a string
//     let msgText: string;
//     try {
//       if (typeof message === 'string') msgText = message;
//       else if (message === null || message === undefined) msgText = '';
//       else msgText = typeof message === 'object' ? JSON.stringify(message) : String(message);
//     } catch (e) {
//       msgText = String(message);
//     }

//     const entry: LogEntry = {
//       userId: this.userId,
//       timestamp: new Date().toISOString(),
//       logLevel: level,
//       message: msgText,
//       deviceInfo: this.getDeviceInfo(),
//       messageType,
//     };

//     this.logs.push(entry);

//     // Console output
//   //  console[level](this.formatMessage(level, msgText, messageType));

//     // Send to backend
//   //   this.http.post(`${environment.apiBaseUrl}/IDVUser/SendConsoleLogAsync`, entry).subscribe({
//   //     next: () => {},
//   //  //   error: (err) => console.error('Failed to send log', err),
//   //   });
//   }

//   /** Get logs as string (for debug or download) */
//   getLogs(): string {
//     return this.logs
//       .map(
//         (l) =>
//           `[${l.timestamp}] [${l.logLevel.toUpperCase()}] [${l.messageType}] ${l.message}`
//       )
//       .join('\n');
//   }

//   /** Clear in-memory logs */
//   clearLogs() {
//     this.logs = [];
//     this.hasLoggedUserInfo = false;
//   }

//   /** Download logs as a text file */
//   downloadLogs() {
//     const logs = this.getLogs();
//     const blob = new Blob([logs], { type: 'text/plain' });

//     const now = new Date();
//     const timestamp = now.toISOString().replace(/:/g, '-').replace(/\..+/, '');
//     const filename = `logs_${timestamp}.txt`;

//     const url = window.URL.createObjectURL(blob);
//     const anchor = document.createElement('a');
//     anchor.href = url;
//     anchor.download = filename;
//     anchor.click();
//     window.URL.revokeObjectURL(url);
//   }
// }
