# Diagramme de Classes — StyleÉchange

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DIAGRAMME DE CLASSES                                │
│                         StyleÉchange — BAC 4                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│      User        │         │    Category      │         │    Product       │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ id: String       │         │ id: String       │         │ id: String       │
│ email: String    │         │ name: String     │         │ title: String    │
│ username: String │         │ slug: String     │         │ description: ?   │
│ name: String     │         │ description: ?   │         │ brand: ?         │
│ avatarUrl: ?     │         │ isActive: Bool   │         │ size: ?          │
│ location: ?      │         │ createdAt: Date  │         │ price: Decimal   │
│ rating: Float?   │         │ updatedAt: Date  │         │ condition: ?     │
│ role: Role       │         └──────────────────┘         │ color: ?         │
│ isBanned: Bool   │                  │ 1                  │ location: ?      │
│ lastSeenAt: ?    │                  │                    │ isActive: Bool   │
│ password: ?      │                  │ *                  │ imageUrl: ?      │
│ createdAt: Date  │         ┌────────┴─────────┐         │ imageUrls: []    │
└──────────────────┘         │  (categoryId FK) │         │ ownerId: String  │
         │                   └──────────────────┘         │ categoryId: ?    │
         │ 1                                               │ createdAt: Date  │
         ├──────────────────────────────────────────────── └──────────────────┘
         │                                                          │
         │ *                                                        │
┌────────┴─────────┐    ┌──────────────────┐    ┌─────────────────┴────────┐
│      Cart        │    │    CartItem      │    │      Favorite            │
├──────────────────┤    ├──────────────────┤    ├──────────────────────────┤
│ id: String       │    │ id: String       │    │ id: String               │
│ userId: String   │    │ cartId: String   │    │ userId: String           │
│ status: CartStat │    │ productId: Str   │    │ productId: String        │
│ createdAt: Date  │    │ unitPrice: Dec   │    │ createdAt: Date          │
│ updatedAt: Date  │    │ quantity: Int    │    └──────────────────────────┘
└──────────────────┘    │ createdAt: Date  │
         │ 1            └──────────────────┘
         │ *
         └── CartItem (cartId FK)

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────────┐
│      Order       │    │  SellerPayout    │    │         Vote             │
├──────────────────┤    ├──────────────────┤    ├──────────────────────────┤
│ id: String       │    │ id: String       │    │ id: String               │
│ buyerId: String  │    │ sellerId: String │    │ userId: String           │
│ sellerId: ?      │    │ orderId: String  │    │ productId: String        │
│ productId: Str   │    │ productId: Str   │    │ value: VoteValue         │
│ status: OrderSt  │    │ grossAmount: Dec │    │ createdAt: Date          │
│ amount: Decimal  │    │ platformFee: Dec │    └──────────────────────────┘
│ protectionFee    │    │ shippingFee: Dec │
│ shippingFee      │    │ netAmount: Dec   │    ┌──────────────────────────┐
│ shippingMethod   │    │ status: Payout   │    │         Review           │
│ shippingAddress  │    │ paidAt: ?        │    ├──────────────────────────┤
│ stripePaymentId  │    │ createdAt: Date  │    │ id: String               │
│ threeDSecure     │    └──────────────────┘    │ authorId: String         │
│ createdAt: Date  │                            │ targetId: String         │
└──────────────────┘                            │ rating: Int (1-5)        │
                                                │ comment: ?               │
┌──────────────────┐    ┌──────────────────┐    │ createdAt: Date          │
│    Sanction      │    │      Ban         │    └──────────────────────────┘
├──────────────────┤    ├──────────────────┤
│ id: String       │    │ id: String       │    ┌──────────────────────────┐
│ userId: String   │    │ userId: String   │    │       Report             │
│ adminId: String  │    │ adminId: String  │    ├──────────────────────────┤
│ type: SanctType  │    │ reason: String   │    │ id: String               │
│ reason: String   │    │ isPermanent: Bool│    │ authorId: String         │
│ notes: ?         │    │ expiresAt: ?     │    │ productId: String        │
│ startsAt: Date   │    │ createdAt: Date  │    │ reason: ReportReason     │
│ endsAt: ?        │    └──────────────────┘    │ details: ?               │
│ createdAt: Date  │                            │ status: ReportStatus     │
└──────────────────┘                            │ createdAt: Date          │
                                                └──────────────────────────┘

┌──────────────────────────┐    ┌──────────────────────────┐
│     MessageThread        │    │        Message           │
├──────────────────────────┤    ├──────────────────────────┤
│ id: String               │    │ id: String               │
│ buyerId: String          │    │ threadId: String         │
│ sellerId: String         │    │ senderId: String         │
│ productId: ?             │    │ text: String             │
│ lastMessageAt: Date      │    │ mediaUrl: ?              │
│ createdAt: Date          │    │ mediaType: ?             │
└──────────────────────────┘    │ isRead: Bool             │
                                │ createdAt: Date          │
                                └──────────────────────────┘

┌──────────────────────────┐
│      Notification        │
├──────────────────────────┤
│ id: String               │
│ userId: String           │
│ type: NotifType          │
│ title: String            │
│ body: String             │
│ link: ?                  │
│ isRead: Bool             │
│ createdAt: Date          │
└──────────────────────────┘

ENUMS:
- Role: USER | ADMIN
- OrderStatus: PENDING | PAID | SHIPPED | DELIVERED | CANCELLED | REFUNDED
- CartStatus: ACTIVE | CHECKED_OUT | ABANDONED
- VoteValue: UP | DOWN
- SanctionType: WARNING | SUSPENSION | RESTRICTION_SELL | RESTRICTION_MESSAGE
- PayoutStatus: PENDING | APPROVED | PAID | FAILED
- ReportReason: FAKE | INAPPROPRIATE | SPAM | COUNTERFEIT | OTHER
- ReportStatus: PENDING | REVIEWED | DISMISSED
- NotificationType: NEW_MESSAGE | NEW_ORDER | ORDER_STATUS | NEW_REVIEW | SANCTION | BAN
```
