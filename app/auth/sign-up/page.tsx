import { SignUpForm } from "@/components/sign-up-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Tabs defaultValue="asAdmin" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="asAdmin">Sign up as Admin</TabsTrigger>
            <TabsTrigger value="asClient">Sign up as Client</TabsTrigger>
          </TabsList>
          <TabsContent value="asAdmin">
            <SignUpForm signUpType={"asAdmin"} />
          </TabsContent>
          <TabsContent value="asClient">
            <SignUpForm signUpType={"asClient"} />
          </TabsContent>
        </Tabs>
        
      </div>
    </div>
  );
}
