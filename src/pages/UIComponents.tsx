import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Settings, 
  User, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit,
  FileText,
  RefreshCw,
  ChevronDown,
  Search,
  Bell,
  Home,
  Folder
} from "lucide-react";
import { cn } from "@/lib/utils";

const ColorSwatch = ({ name, cssVar, description }: { name: string; cssVar: string; description?: string }) => (
  <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
    <div 
      className="w-12 h-12 rounded-lg shadow-sm border border-border/30"
      style={{ backgroundColor: `hsl(var(${cssVar}))` }}
    />
    <div className="flex-1">
      <p className="text-sm font-medium text-foreground">{name}</p>
      <code className="text-xs text-muted-foreground">{cssVar}</code>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
  </div>
);

const Section = ({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) => (
  <section id={id} className="space-y-6">
    <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">{title}</h2>
    {children}
  </section>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
    {children}
  </div>
);

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto border border-border/50">
        <code className="text-foreground">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-background/80 hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

const UIComponents = () => {
  const [progress, setProgress] = useState(65);
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);

  const handleBack = () => {
    window.location.href = "/";
  };

  const navItems = [
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "buttons", label: "Buttons" },
    { id: "inputs", label: "Form Inputs" },
    { id: "cards", label: "Cards" },
    { id: "navigation", label: "Navigation" },
    { id: "feedback", label: "Feedback" },
    { id: "overlays", label: "Overlays" },
    { id: "data-display", label: "Data Display" },
    { id: "utilities", label: "Utilities" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-4">
            <h1 className="text-lg font-semibold text-foreground">UI Components</h1>
            <p className="text-xs text-muted-foreground">Design System Documentation</p>
          </div>
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Enplify.ai Design System</h1>
            <p className="text-muted-foreground">
              A comprehensive guide to all UI components, colors, typography, and patterns used throughout the application.
            </p>
          </div>

          {/* Colors Section */}
          <Section title="Colors" id="colors">
            <SubSection title="Core Colors">
              <div className="grid grid-cols-2 gap-3">
                <ColorSwatch name="Background" cssVar="--background" description="Main page background" />
                <ColorSwatch name="Foreground" cssVar="--foreground" description="Primary text color" />
                <ColorSwatch name="Primary" cssVar="--primary" description="Brand color, CTAs" />
                <ColorSwatch name="Primary Foreground" cssVar="--primary-foreground" description="Text on primary" />
              </div>
            </SubSection>

            <SubSection title="Surface Colors">
              <div className="grid grid-cols-2 gap-3">
                <ColorSwatch name="Card" cssVar="--card" description="Card backgrounds" />
                <ColorSwatch name="Card Foreground" cssVar="--card-foreground" description="Card text" />
                <ColorSwatch name="Popover" cssVar="--popover" description="Dropdown backgrounds" />
                <ColorSwatch name="Muted" cssVar="--muted" description="Subtle backgrounds" />
                <ColorSwatch name="Muted Foreground" cssVar="--muted-foreground" description="Secondary text" />
                <ColorSwatch name="Accent" cssVar="--accent" description="Hover states" />
              </div>
            </SubSection>

            <SubSection title="Semantic Colors">
              <div className="grid grid-cols-2 gap-3">
                <ColorSwatch name="Destructive" cssVar="--destructive" description="Error, delete actions" />
                <ColorSwatch name="Border" cssVar="--border" description="All borders" />
                <ColorSwatch name="Input" cssVar="--input" description="Input backgrounds" />
                <ColorSwatch name="Ring" cssVar="--ring" description="Focus rings" />
              </div>
            </SubSection>

            <SubSection title="Sidebar Colors">
              <div className="grid grid-cols-2 gap-3">
                <ColorSwatch name="Sidebar Background" cssVar="--sidebar-background" />
                <ColorSwatch name="Sidebar Foreground" cssVar="--sidebar-foreground" />
                <ColorSwatch name="Sidebar Border" cssVar="--sidebar-border" />
                <ColorSwatch name="Sidebar Accent" cssVar="--sidebar-accent" />
              </div>
            </SubSection>
          </Section>

          {/* Typography Section */}
          <Section title="Typography" id="typography">
            <SubSection title="Font Family">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-sans text-foreground">Inter - Primary font for all UI text</p>
                <code className="text-xs text-muted-foreground">font-family: 'Inter', system-ui, -apple-system, sans-serif</code>
              </div>
            </SubSection>

            <SubSection title="Text Scale">
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-xs (12px)</p>
                  <p className="text-xs text-foreground">The quick brown fox jumps over the lazy dog</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-sm (14px)</p>
                  <p className="text-sm text-foreground">The quick brown fox jumps over the lazy dog</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-base (16px)</p>
                  <p className="text-base text-foreground">The quick brown fox jumps over the lazy dog</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-lg (18px)</p>
                  <p className="text-lg text-foreground">The quick brown fox jumps over the lazy dog</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-xl (20px)</p>
                  <p className="text-xl text-foreground">The quick brown fox jumps over the lazy dog</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-2xl (24px)</p>
                  <p className="text-2xl text-foreground">The quick brown fox jumps over the lazy dog</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">text-3xl (30px)</p>
                  <p className="text-3xl text-foreground">The quick brown fox jumps</p>
                </div>
              </div>
            </SubSection>

            <SubSection title="Font Weights">
              <div className="space-y-3 p-4 border border-border rounded-lg">
                <p className="font-normal text-foreground">font-normal (400) - Regular body text</p>
                <p className="font-medium text-foreground">font-medium (500) - UI elements, labels</p>
                <p className="font-semibold text-foreground">font-semibold (600) - Headings, emphasis</p>
                <p className="font-bold text-foreground">font-bold (700) - Strong emphasis</p>
              </div>
            </SubSection>

            <SubSection title="Special Text Styles">
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Micro Label - text-[11px] font-semibold uppercase tracking-wider
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-[15px] leading-relaxed text-foreground">
                    Chat Message Text - text-[15px] leading-relaxed
                  </p>
                </div>
              </div>
            </SubSection>
          </Section>

          {/* Buttons Section */}
          <Section title="Buttons" id="buttons">
            <SubSection title="Button Variants">
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
              <CodeBlock code={`<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>`} />
            </SubSection>

            <SubSection title="Button Sizes">
              <div className="flex items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Plus className="w-4 h-4" /></Button>
              </div>
            </SubSection>

            <SubSection title="Button States">
              <div className="flex flex-wrap gap-3">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button className="opacity-50 pointer-events-none">Loading...</Button>
              </div>
            </SubSection>

            <SubSection title="Icon Buttons">
              <div className="flex items-center gap-3">
                <Button size="icon" variant="ghost">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
                  <Copy className="w-[18px] h-[18px]" />
                </button>
                <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
                  <RefreshCw className="w-[18px] h-[18px]" />
                </button>
              </div>
            </SubSection>
          </Section>

          {/* Form Inputs Section */}
          <Section title="Form Inputs" id="inputs">
            <SubSection title="Text Input">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="default-input">Default Input</Label>
                  <Input id="default-input" placeholder="Enter text..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disabled-input">Disabled Input</Label>
                  <Input id="disabled-input" placeholder="Disabled..." disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search-input">Search Input</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="search-input" placeholder="Search..." className="pl-9" />
                  </div>
                </div>
              </div>
            </SubSection>

            <SubSection title="Textarea">
              <div className="max-w-md">
                <Label htmlFor="textarea">Message</Label>
                <Textarea id="textarea" placeholder="Type your message here..." className="mt-2" />
              </div>
            </SubSection>

            <SubSection title="Select">
              <div className="max-w-md">
                <Label>Select an option</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SubSection>

            <SubSection title="Checkbox & Switch">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="checkbox" 
                    checked={checkboxValue}
                    onCheckedChange={(checked) => setCheckboxValue(!!checked)}
                  />
                  <Label htmlFor="checkbox">Checkbox label</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    id="switch"
                    checked={switchValue}
                    onCheckedChange={setSwitchValue}
                  />
                  <Label htmlFor="switch">Switch label</Label>
                </div>
              </div>
            </SubSection>
          </Section>

          {/* Cards Section */}
          <Section title="Cards" id="cards">
            <SubSection title="Basic Card">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description goes here</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is the card content area. Use cards to group related content together.
                  </p>
                </CardContent>
              </Card>
            </SubSection>

            <SubSection title="Interactive Card">
              <Card className="max-w-md hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Interactive Card</CardTitle>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Hover and click interactions applied.
                  </p>
                </CardContent>
              </Card>
            </SubSection>

            <SubSection title="Premium Settings Card Pattern">
              <Card className="rounded-xl shadow-sm border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Settings Section</CardTitle>
                  <CardDescription>Manage your preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-[140px_1fr_40px] gap-4 items-center py-2 hover:bg-accent/50 rounded-md px-2 -mx-2 group">
                    <span className="text-sm font-medium">Setting Name</span>
                    <span className="text-sm text-muted-foreground">Setting value</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-accent rounded">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>
          </Section>

          {/* Navigation Section */}
          <Section title="Navigation" id="navigation">
            <SubSection title="Nav Item Styles">
              <div className="w-64 border border-border rounded-lg p-2 space-y-1">
                <div className="nav-item">
                  <Home className="w-4 h-4" />
                  <span>Default Nav Item</span>
                </div>
                <div className="nav-item nav-item-active">
                  <Folder className="w-4 h-4" />
                  <span>Active Nav Item</span>
                </div>
                <div className="chat-item">
                  <FileText className="w-4 h-4" />
                  <span className="truncate">Chat Item Style</span>
                </div>
                <div className="chat-item chat-item-active">
                  <FileText className="w-4 h-4" />
                  <span className="truncate">Active Chat Item</span>
                </div>
              </div>
            </SubSection>

            <SubSection title="Tabs">
              <Tabs defaultValue="tab1" className="max-w-md">
                <TabsList>
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="p-4 border rounded-lg mt-2">
                  Tab 1 content
                </TabsContent>
                <TabsContent value="tab2" className="p-4 border rounded-lg mt-2">
                  Tab 2 content
                </TabsContent>
                <TabsContent value="tab3" className="p-4 border rounded-lg mt-2">
                  Tab 3 content
                </TabsContent>
              </Tabs>
            </SubSection>

            <SubSection title="Dropdown Menu">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Open Menu
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SubSection>
          </Section>

          {/* Feedback Section */}
          <Section title="Feedback" id="feedback">
            <SubSection title="Badges">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </SubSection>

            <SubSection title="Progress">
              <div className="max-w-md space-y-4">
                <Progress value={progress} />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setProgress(Math.max(0, progress - 10))}>
                    -10%
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setProgress(Math.min(100, progress + 10))}>
                    +10%
                  </Button>
                </div>
              </div>
            </SubSection>

            <SubSection title="Streaming Indicators">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Streaming Cursor:</span>
                  <span className="streaming-cursor" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Streaming Dots:</span>
                  <div className="streaming-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </SubSection>
          </Section>

          {/* Overlays Section */}
          <Section title="Overlays" id="overlays">
            <SubSection title="Dialog">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog Title</DialogTitle>
                    <DialogDescription>
                      This is a description of what the dialog is about.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">Dialog content goes here.</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </SubSection>

            <SubSection title="Tooltip">
              <div className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </SubSection>
          </Section>

          {/* Data Display Section */}
          <Section title="Data Display" id="data-display">
            <SubSection title="Avatar">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                  AB
                </div>
              </div>
            </SubSection>

            <SubSection title="Accordion">
              <Accordion type="single" collapsible className="max-w-md">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Section 1</AccordionTrigger>
                  <AccordionContent>
                    Content for section 1 goes here.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Section 2</AccordionTrigger>
                  <AccordionContent>
                    Content for section 2 goes here.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </SubSection>

            <SubSection title="Separator">
              <div className="max-w-md space-y-2">
                <p className="text-sm">Above separator</p>
                <Separator />
                <p className="text-sm">Below separator</p>
              </div>
            </SubSection>
          </Section>

          {/* Utilities Section */}
          <Section title="Utilities" id="utilities">
            <SubSection title="Spacing Scale">
              <div className="space-y-2">
                {[1, 2, 3, 4, 6, 8, 12, 16].map((size) => (
                  <div key={size} className="flex items-center gap-4">
                    <code className="text-xs text-muted-foreground w-16">gap-{size}</code>
                    <div 
                      className="h-4 bg-primary rounded"
                      style={{ width: `${size * 4}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{size * 4}px</span>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Border Radius">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-primary rounded-sm flex items-center justify-center text-primary-foreground text-xs">sm</div>
                <div className="w-16 h-16 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-xs">md</div>
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xs">lg</div>
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-xs">xl</div>
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground text-xs">2xl</div>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">full</div>
              </div>
            </SubSection>

            <SubSection title="Shadows">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-card rounded-lg shadow-sm flex items-center justify-center text-xs">shadow-sm</div>
                <div className="w-20 h-20 bg-card rounded-lg shadow flex items-center justify-center text-xs">shadow</div>
                <div className="w-20 h-20 bg-card rounded-lg shadow-md flex items-center justify-center text-xs">shadow-md</div>
                <div className="w-20 h-20 bg-card rounded-lg shadow-lg flex items-center justify-center text-xs">shadow-lg</div>
              </div>
            </SubSection>

            <SubSection title="Transitions">
              <div className="flex gap-4">
                <Button className="transition-colors">transition-colors</Button>
                <Button className="transition-opacity hover:opacity-80">transition-opacity</Button>
                <Button className="transition-transform hover:scale-105">transition-transform</Button>
              </div>
            </SubSection>
          </Section>

          {/* Footer */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Enplify.ai Design System v1.0 • Built with React, Tailwind CSS, and shadcn/ui
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UIComponents;
