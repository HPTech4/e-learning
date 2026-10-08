export type Database = {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          short_name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          short_name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_name?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          school_id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'departments_school_id_fkey'
            columns: ['school_id']
            referencedRelation: 'schools'
            referencedColumns: ['id']
          }
        ]
      }
      materials: {
        Row: {
          id: string
          department_id: string
          level: number
          course_code: string
          course_title: string
          file_url: string
          file_name: string
          file_size: number | null
          download_count: number
          last_downloaded_at: string | null
          uploaded_by: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          department_id: string
          level: number
          course_code: string
          course_title: string
          file_url: string
          file_name: string
          file_size?: number | null
          download_count?: number
          last_downloaded_at?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          department_id?: string
          level?: number
          course_code?: string
          course_title?: string
          file_url?: string
          file_name?: string
          file_size?: number | null
          download_count?: number
          last_downloaded_at?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'materials_department_id_fkey'
            columns: ['department_id']
            referencedRelation: 'departments'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_download: {
        Args: { material_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience types
export type School = Database['public']['Tables']['schools']['Row']
export type Department = Database['public']['Tables']['departments']['Row']
export type Material = Database['public']['Tables']['materials']['Row']
