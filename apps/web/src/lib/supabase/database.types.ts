
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "brand_memberships": {
                  Row: {
                    "brand_id": string,"created_at": string,"role": string,"user_id": string
                  }
                  Insert: {
                    "brand_id": string,"created_at"?: string,"role": string,"user_id": string
                  }
                  Update: {
                    "brand_id"?: string,"created_at"?: string,"role"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "brand_memberships_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "brand_memberships_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"brands": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"procedures": string,"slug": string,"voice_summary": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"procedures"?: string,"slug": string,"voice_summary"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"procedures"?: string,"slug"?: string,"voice_summary"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string,"id": string
                  }
                  Insert: {
                    "created_at"?: string,"full_name": string,"id": string
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string,"id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"replies": {
                  Row: {
                    "brand_id": string,"channel": string,"created_at": string,"customer_message": string,"customer_name": string,"external_id": string,"id": string,"received_at": string,"reply_body": string,"sent_at": string,"source": string,"specialist_id": string,"subject": string
                  }
                  Insert: {
                    "brand_id": string,"channel": string,"created_at"?: string,"customer_message": string,"customer_name": string,"external_id": string,"id"?: string,"received_at": string,"reply_body": string,"sent_at": string,"source"?: string,"specialist_id": string,"subject": string
                  }
                  Update: {
                    "brand_id"?: string,"channel"?: string,"created_at"?: string,"customer_message"?: string,"customer_name"?: string,"external_id"?: string,"id"?: string,"received_at"?: string,"reply_body"?: string,"sent_at"?: string,"source"?: string,"specialist_id"?: string,"subject"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "replies_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "replies_specialist_id_fkey"
      columns: ["specialist_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"review_tag_links": {
                  Row: {
                    "review_id": string,"tag_id": string
                  }
                  Insert: {
                    "review_id": string,"tag_id": string
                  }
                  Update: {
                    "review_id"?: string,"tag_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "review_tag_links_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "reviews"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_tag_links_tag_id_fkey"
      columns: ["tag_id"]
isOneToOne: false
      referencedRelation: "review_tags"
      referencedColumns: ["id"]
    }
                  ]
                },"review_tags": {
                  Row: {
                    "active": boolean,"brand_id": string | null,"code": string,"created_at": string,"id": string,"label": string,"severity": string
                  }
                  Insert: {
                    "active"?: boolean,"brand_id"?: string | null,"code": string,"created_at"?: string,"id"?: string,"label": string,"severity": string
                  }
                  Update: {
                    "active"?: boolean,"brand_id"?: string | null,"code"?: string,"created_at"?: string,"id"?: string,"label"?: string,"severity"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "review_tags_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    }
                  ]
                },"reviews": {
                  Row: {
                    "brand_id": string,"comment": string,"created_at": string,"id": string,"is_exemplar": boolean,"reply_id": string,"reviewer_id": string,"score": number,"updated_at": string
                  }
                  Insert: {
                    "brand_id": string,"comment"?: string,"created_at"?: string,"id"?: string,"is_exemplar"?: boolean,"reply_id": string,"reviewer_id": string,"score": number,"updated_at"?: string
                  }
                  Update: {
                    "brand_id"?: string,"comment"?: string,"created_at"?: string,"id"?: string,"is_exemplar"?: boolean,"reply_id"?: string,"reviewer_id"?: string,"score"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_reply_brand_fkey"
      columns: ["reply_id","brand_id"]
isOneToOne: false
      referencedRelation: "replies"
      referencedColumns: ["id","brand_id"]
    },{
      foreignKeyName: "reviews_reviewer_id_fkey"
      columns: ["reviewer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "is_brand_lead":
{ Args: { "p_brand_id": string }; Returns: boolean
                           },
"is_brand_member":
{ Args: { "p_brand_id": string }; Returns: boolean
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const

