import { describe, it, expect } from 'vitest';
import { ASTExtractor } from '../../src/compressor/ast-extractor.js';

describe('ASTExtractor', () => {
  it('extracts interface definitions intact', () => {
    const code = `
      export interface UserSession {
        id: string;
        roles: string[];
        createdAt: Date;
      }
    `;
    const res = ASTExtractor.extractFromString(code);
    expect(res.typeSkeleton).toContain('interface UserSession');
    expect(res.typeSkeleton).toContain('id: string;');
    expect(res.typeSkeleton).toContain('roles: string[];');
  });

  it('strips function bodies while preserving signatures', () => {
    const code = `
      export function verifyToken(rawToken: string, secret: string): boolean {
        // complex jwt decode
        const decoded = JSON.parse(rawToken);
        if (!decoded) return false;
        return true;
      }
    `;
    const res = ASTExtractor.extractFromString(code);
    expect(res.typeSkeleton).toContain('export declare function verifyToken(rawToken: string, secret: string): boolean;');
    expect(res.typeSkeleton).not.toContain('const decoded');
    expect(res.typeSkeleton).not.toContain('JSON.parse');
    expect(res.skeletonLength).toBeLessThan(res.originalLength);
  });

  it('strips class method and constructor bodies', () => {
    const code = `
      export class AuthService {
        private secretKey: string;

        constructor(secretKey: string) {
          this.secretKey = secretKey;
          console.log('init');
        }

        public validateLogin(username: string): Promise<boolean> {
          const user = db.find(username);
          return user.isValid();
        }
      }
    `;
    const res = ASTExtractor.extractFromString(code);
    expect(res.typeSkeleton).toContain('export class AuthService');
    expect(res.typeSkeleton).toContain('constructor(secretKey: string);');
    expect(res.typeSkeleton).toContain('validateLogin(username: string): Promise<boolean>;');
    expect(res.typeSkeleton).not.toContain('console.log');
    expect(res.typeSkeleton).not.toContain('db.find');
  });
});
