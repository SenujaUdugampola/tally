import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

//convex has query - fetch , mutation - create, update, delete
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    // Note: If you don't want to define an index right away, you can use
    // ctx.db.query("users")
    //  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
    //  .unique();
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    const safeName = identity.name ?? "Anonymous";

    if (user !== null) {
      // Update the user if either the name OR the image has changed
      if (user.name !== safeName || user.imageUrl !== identity.pictureUrl) {
        await ctx.db.patch("users", user._id, { 
          name: safeName,
          imageUrl: identity.pictureUrl 
        });
      }
      return user._id;
    }

    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name: safeName,
      email: identity.email,
      tokenIdentifier: identity.tokenIdentifier,
      imageUrl: identity.pictureUrl,
    });
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if(!user) {
      throw new Error("User not found in database");
    }

    return user;
  },
});

export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    // Don't search if query is too short
    if (args.query.length < 2) {
      return [];
    }

    // Search by name using search index
    const nameResults= await ctx.db
      .query("users")
      .withSearchIndex("search_name",(q)=>q.search("name", args.query))
      .collect();

    // Search by email using search index
    const emailResults = await ctx.db
      .query("users")
      .withSearchIndex("search_email", (q) => q.search("email", args.query))
      .collect();

    // Combine results (removing duplicates)
    const users = [
      ... nameResults,
      ... emailResults.filter(
        (email)=>!nameResults.some((name)=>name ._id === email ._id)
      ),
    ]

    return users
      .filter((user) => user._id !== currentUser._id)
      .map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      }));
  }
});