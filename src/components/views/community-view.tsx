'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Plus, Heart, MessageSquare, Flag, Send, Globe, Building2, School, GraduationCap, Leaf } from 'lucide-react'
import { api, ApiError } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth-context'

interface Community { id: string; name: string; description: string; category: string; owner: string; members: number; posts: number; isPrivate: boolean; joined: boolean; createdAt: string }
interface Post { id: string; content: string; imageUrl: string | null; postType: string; author: { id: string; name: string }; communityId: string | null; likeCount: number; commentCount: number; isPinned: boolean; likedByMe: boolean; createdAt: string }

const CAT_ICONS: Record<string, React.ElementType> = { GENERAL: Users, NGO: Leaf, RWA: Building2, SCHOOL: School, COLLEGE: GraduationCap, CORPORATE: Building2 }

export function CommunityView() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCat, setNewCat] = useState('GENERAL')
  const [newPost, setNewPost] = useState('')
  const [activeCommunity, setActiveCommunity] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [c, p] = await Promise.all([
        api.get<{ communities: Community[] }>('/community'),
        api.get<{ posts: Post[] }>('/community/posts')
      ])
      setCommunities(c.communities)
      setPosts(p.posts)
    } catch {} finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const joinLeave = async (c: Community) => {
    try {
      await api.post('/community/posts', { action: c.joined ? 'leave' : 'join', communityId: c.id })
      toast({ title: c.joined ? 'Left community' : 'Joined community', description: c.name })
      load()
    } catch (e) {
      toast({ title: 'Action failed', description: e instanceof ApiError ? e.message : '', variant: 'destructive' })
    }
  }

  const createCommunity = async () => {
    if (!newName.trim()) return
    try {
      await api.post('/community', { name: newName, description: newDesc, category: newCat })
      toast({ title: 'Community created', description: 'You are now the admin of this community.' })
      setShowCreate(false); setNewName(''); setNewDesc('')
      load()
    } catch (e) {
      toast({ title: 'Creation failed', description: e instanceof ApiError ? e.message : '', variant: 'destructive' })
    }
  }

  const createPost = async () => {
    if (!newPost.trim()) return
    try {
      await api.post('/community/posts', {
        action: 'post',
        content: newPost,
        communityId: activeCommunity,
        postType: 'DISCUSSION'
      })
      setNewPost('')
      toast({ title: 'Post published' })
      load()
    } catch (e) {
      toast({ title: 'Post failed', description: e instanceof ApiError ? e.message : '', variant: 'destructive' })
    }
  }

  const like = async (postId: string) => {
    try {
      await api.post('/community/posts', { action: 'like', postId })
      setPosts(ps => ps.map(p => p.id === postId ? {
        ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1
      } : p))
    } catch {}
  }

  const report = async (postId: string) => {
    try {
      await api.post('/community/posts', { action: 'report', postId, reason: 'Inappropriate content' })
      toast({ title: 'Reported', description: 'Thank you. Moderators will review this post.' })
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2"><Users className="h-7 w-7 text-primary" /> Green Community Hub</h1>
          <p className="text-muted-foreground">Join RWAs, schools, colleges, and NGOs. Share actions, organise campaigns, learn together.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Create</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Communities list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Communities</CardTitle>
            <CardDescription>{communities.length} communities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto scroll-thin">
            <button
              onClick={() => setActiveCommunity(null)}
              className={`w-full text-left p-3 rounded-lg border ${!activeCommunity ? 'border-primary bg-accent/40' : 'bg-card'}`}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">All posts</span>
              </div>
            </button>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
            ) : communities.map(c => {
              const Icon = CAT_ICONS[c.category] || Users
              return (
                <div
                  key={c.id}
                  className={`p-3 rounded-lg border cursor-pointer ${activeCommunity === c.id ? 'border-primary bg-accent/40' : 'bg-card hover:bg-accent/30'}`}
                  onClick={() => setActiveCommunity(c.id)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium text-sm truncate">{c.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{c.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{c.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{c.members} members</span>
                    <Button size="sm" variant={c.joined ? 'outline' : 'default'} className="h-6 text-xs" onClick={(e) => { e.stopPropagation(); joinLeave(c) }}>
                      {c.joined ? 'Leave' : 'Join'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Posts feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Composer */}
          <Card>
            <CardContent className="pt-4">
              <Textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder={`Share a green action, ask a question, or post an educational tip...${activeCommunity ? ' (Posting to selected community)' : ' (Public post)'}`}
                rows={3}
                maxLength={2000}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{newPost.length}/2000</span>
                <Button size="sm" onClick={createPost} disabled={!newPost.trim()}>
                  <Send className="h-3 w-3 mr-1" /> Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feed */}
          {posts.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No posts yet. Be the first to share!</CardContent></Card>
          ) : posts.map(p => (
            <Card key={p.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {p.author.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{p.author.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{p.postType}</Badge>
                </div>
                <p className="text-sm whitespace-pre-wrap mb-3">{p.content}</p>
                <div className="flex items-center gap-4 pt-2 border-t">
                  <button onClick={() => like(p.id)} className={`flex items-center gap-1 text-xs ${p.likedByMe ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Heart className={`h-3.5 w-3.5 ${p.likedByMe ? 'fill-current' : ''}`} /> {p.likeCount}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <MessageSquare className="h-3.5 w-3.5" /> {p.commentCount}
                  </button>
                  {user && p.author.id !== user.id && (
                    <button onClick={() => report(p.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive ml-auto">
                      <Flag className="h-3.5 w-3.5" /> Report
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create community dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Green Community</DialogTitle>
            <DialogDescription>Start a community for your RWA, school, college, NGO, or locality.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cname">Community Name</Label>
              <Input id="cname" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Satellite RWA Eco Club" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cdesc">Description</Label>
              <Textarea id="cdesc" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} placeholder="What is your community about?" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={newCat} onValueChange={setNewCat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="RWA">RWA / Residential</SelectItem>
                  <SelectItem value="SCHOOL">School</SelectItem>
                  <SelectItem value="COLLEGE">College</SelectItem>
                  <SelectItem value="NGO">NGO</SelectItem>
                  <SelectItem value="CORPORATE">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={createCommunity}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
