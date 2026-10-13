export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          city: string | null;
          upi_id: string | null;
          role: 'seeker' | 'dealer' | 'admin';
          rating: number | null;
          avatar_url: string | null;
          wallet_balance: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          city?: string | null;
          upi_id?: string | null;
          role?: 'seeker' | 'dealer' | 'admin';
          rating?: number | null;
          avatar_url?: string | null;
          wallet_balance?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          city?: string | null;
          upi_id?: string | null;
          role?: 'seeker' | 'dealer' | 'admin';
          rating?: number | null;
          avatar_url?: string | null;
          wallet_balance?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          dealer_id: string | null;
          category: string;
          category_display: string | null;
          title: string;
          dealer_name: string;
          dealer_rating: number | null;
          image_url: string;
          pay: string;
          pay_type: string;
          raw_pay: number;
          venue_name: string | null;
          location: string;
          lat: number | null;
          lng: number | null;
          date: string;
          start_at: string;
          end_at: string | null;
          time: string;
          reporting_time: string | null;
          duration_hours: number | null;
          slots_total: number;
          slots_filled: number;
          urgent: boolean | null;
          instant_pay: boolean | null;
          gender_req: string | null;
          perks: string[] | null;
          requirements: string | null;
          dress_code: string | null;
          description: string | null;
          phone: string | null;
          status: 'active' | 'completed' | 'cancelled' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealer_id?: string | null;
          category: string;
          category_display?: string | null;
          title: string;
          dealer_name: string;
          dealer_rating?: number | null;
          image_url?: string;
          pay: string;
          pay_type?: string;
          raw_pay?: number;
          venue_name?: string | null;
          location: string;
          lat?: number | null;
          lng?: number | null;
          date: string;
          start_at: string;
          end_at?: string | null;
          time: string;
          reporting_time?: string | null;
          duration_hours?: number | null;
          slots_total?: number;
          slots_filled?: number;
          urgent?: boolean | null;
          instant_pay?: boolean | null;
          gender_req?: string | null;
          perks?: string[] | null;
          requirements?: string | null;
          dress_code?: string | null;
          description?: string | null;
          phone?: string | null;
          status?: 'active' | 'completed' | 'cancelled' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealer_id?: string | null;
          category?: string;
          category_display?: string | null;
          title?: string;
          dealer_name?: string;
          dealer_rating?: number | null;
          image_url?: string;
          pay?: string;
          pay_type?: string;
          raw_pay?: number;
          venue_name?: string | null;
          location?: string;
          lat?: number | null;
          lng?: number | null;
          date?: string;
          start_at?: string;
          end_at?: string | null;
          time?: string;
          reporting_time?: string | null;
          duration_hours?: number | null;
          slots_total?: number;
          slots_filled?: number;
          urgent?: boolean | null;
          instant_pay?: boolean | null;
          gender_req?: string | null;
          perks?: string[] | null;
          requirements?: string | null;
          dress_code?: string | null;
          description?: string | null;
          phone?: string | null;
          status?: 'active' | 'completed' | 'cancelled' | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'jobs_dealer_id_fkey';
            columns: ['dealer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          user_id: string;
          status: 'Applied' | 'Under Review' | 'Accepted' | 'Declined' | 'Completed' | 'Cancelled';
          payment_id?: string | null;
          applied_at: string;
          updated_at?: string;
          notes?: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          user_id: string;
          status?: 'Applied' | 'Under Review' | 'Accepted' | 'Declined' | 'Completed' | 'Cancelled';
          payment_id?: string | null;
          applied_at?: string;
          updated_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string;
          user_id?: string;
          status?: 'Applied' | 'Under Review' | 'Accepted' | 'Declined' | 'Completed' | 'Cancelled';
          payment_id?: string | null;
          applied_at?: string;
          updated_at?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'applications_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'applications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      saved_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          saved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          saved_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string;
          saved_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_jobs_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saved_jobs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string | null;
          message: string;
          read: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          receiver_id?: string | null;
          message: string;
          read?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          receiver_id?: string | null;
          message?: string;
          read?: boolean | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          job_id: string | null;
          is_read: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: string;
          title: string;
          message: string;
          job_id?: string | null;
          is_read?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          job_id?: string | null;
          is_read?: boolean | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type JobRow = Database['public']['Tables']['jobs']['Row'];
export type ApplicationRow = Database['public']['Tables']['applications']['Row'];
export type SavedJobRow = Database['public']['Tables']['saved_jobs']['Row'];
export type MessageRow = Database['public']['Tables']['messages']['Row'];
export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
