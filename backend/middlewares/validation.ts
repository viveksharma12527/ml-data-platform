// middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
interface ValidationOptions {
  source?: 'body' | 'query' | 'params';
  mergeData?: (req: Request) => Record<string, any>;
}

export const validate = (schema: AnyZodObject, options: ValidationOptions = {}) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { source = 'body', mergeData } = options;
      
      // Get data from specified source
      const sourceData = req[source];
      
      // Merge with additional data if provided
      const dataToValidate = mergeData 
        ? { ...sourceData, ...mergeData(req) }
        : sourceData;

      console.log(dataToValidate);
      schema.parse(dataToValidate);
      
      // Replace the original data with validated data
      req[source] = dataToValidate;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };